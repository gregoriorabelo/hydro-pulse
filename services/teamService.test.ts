import { beforeEach, describe, expect, it, vi } from "vitest";

const sqlMock = vi.fn();
const sendEmailMock = vi.fn();
const createTeamInviteTokenMock = vi.fn();
const verifyTeamInviteTokenMock = vi.fn();

vi.mock("@/lib/db", () => ({ sql: sqlMock }));
vi.mock("@/lib/email", () => ({ sendEmail: sendEmailMock }));
vi.mock("@/lib/teamInvite", () => ({
  createTeamInviteToken: createTeamInviteTokenMock,
  verifyTeamInviteToken: verifyTeamInviteTokenMock,
}));

const {
  createTeamInvite,
  getInviteDetails,
  acceptInviteForExistingUser,
  acceptInviteForNewUser,
  cancelInvite,
  removeTeamMember,
  listTeam,
  countInvitedMembers,
  isInvitableRole,
} = await import("./teamService");

const FUTURE_ISO = new Date(Date.now() + 1000 * 60 * 60).toISOString();
const PAST_ISO = new Date(Date.now() - 1000 * 60 * 60).toISOString();

beforeEach(() => {
  sqlMock.mockReset();
  sendEmailMock.mockReset();
  createTeamInviteTokenMock.mockReset();
  verifyTeamInviteTokenMock.mockReset();
  createTeamInviteTokenMock.mockResolvedValue("fake-token");
  sendEmailMock.mockResolvedValue({ sent: true });
});

describe("isInvitableRole", () => {
  it("accepts sindico, operador and visualizador", () => {
    expect(isInvitableRole("sindico")).toBe(true);
    expect(isInvitableRole("operador")).toBe(true);
    expect(isInvitableRole("visualizador")).toBe(true);
  });

  it("rejects admin — self-invite can never create another condo admin", () => {
    expect(isInvitableRole("admin")).toBe(false);
  });
});

describe("createTeamInvite", () => {
  it("rejects an attempt to invite as admin", async () => {
    const result = await createTeamInvite(
      "condo-1",
      "novo@teste.com",
      "admin" as never,
      "user-1",
      "https://hydro-pulse.example"
    );

    expect(result.ok).toBe(false);
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const result = await createTeamInvite(
      "condo-1",
      "não-é-email",
      "operador",
      "user-1",
      "https://hydro-pulse.example"
    );

    expect(result.ok).toBe(false);
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it("rejects once active + pending already hit the limit", async () => {
    sqlMock.mockResolvedValueOnce([{ count: 1 }]); // countInvitedMembers
    sqlMock.mockResolvedValueOnce([{ count: 1 }]); // countPendingInvites

    const result = await createTeamInvite(
      "condo-1",
      "novo@teste.com",
      "operador",
      "user-1",
      "https://hydro-pulse.example"
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("limite");
  });

  it("rejects when the email already has access to this condominium", async () => {
    sqlMock.mockResolvedValueOnce([{ count: 0 }]); // active
    sqlMock.mockResolvedValueOnce([{ count: 0 }]); // pending
    sqlMock.mockResolvedValueOnce([{ name: "Long Beach" }]); // condo name
    sqlMock.mockResolvedValueOnce([{ exists: 1 }]); // already linked

    const result = await createTeamInvite(
      "condo-1",
      "ja@teste.com",
      "operador",
      "user-1",
      "https://hydro-pulse.example"
    );

    expect(result.ok).toBe(false);
  });

  it("rejects when there is already a pending invite for that email", async () => {
    sqlMock.mockResolvedValueOnce([{ count: 0 }]);
    sqlMock.mockResolvedValueOnce([{ count: 0 }]);
    sqlMock.mockResolvedValueOnce([{ name: "Long Beach" }]);
    sqlMock.mockResolvedValueOnce([]); // not linked
    sqlMock.mockResolvedValueOnce([{ exists: 1 }]); // already pending

    const result = await createTeamInvite(
      "condo-1",
      "pendente@teste.com",
      "operador",
      "user-1",
      "https://hydro-pulse.example"
    );

    expect(result.ok).toBe(false);
  });

  it("creates a pending invite and sends the e-mail with the invite link", async () => {
    sqlMock.mockResolvedValueOnce([{ count: 0 }]);
    sqlMock.mockResolvedValueOnce([{ count: 0 }]);
    sqlMock.mockResolvedValueOnce([{ name: "Long Beach" }]);
    sqlMock.mockResolvedValueOnce([]); // not linked
    sqlMock.mockResolvedValueOnce([]); // no pending invite yet
    sqlMock.mockResolvedValueOnce([{ id: "invite-1" }]); // insert team_invites

    const result = await createTeamInvite(
      "condo-1",
      "Novo@Teste.com",
      "sindico",
      "user-1",
      "https://hydro-pulse.example"
    );

    expect(result.ok).toBe(true);
    expect(createTeamInviteTokenMock).toHaveBeenCalledWith("invite-1");
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock.mock.calls[0][0].to).toBe("novo@teste.com");
  });
});

describe("getInviteDetails", () => {
  it("returns an error for an invalid token", async () => {
    verifyTeamInviteTokenMock.mockResolvedValueOnce(null);

    const result = await getInviteDetails("bad-token");

    expect(result.ok).toBe(false);
  });

  it("returns an error when the invite was already accepted", async () => {
    verifyTeamInviteTokenMock.mockResolvedValueOnce("invite-1");
    sqlMock.mockResolvedValueOnce([
      {
        id: "invite-1",
        condominium_id: "condo-1",
        email: "ja@teste.com",
        role: "operador",
        accepted_at: new Date().toISOString(),
        expires_at: FUTURE_ISO,
        condominium_name: "Long Beach",
      },
    ]);

    const result = await getInviteDetails("token");

    expect(result.ok).toBe(false);
  });

  it("returns an error when the invite expired", async () => {
    verifyTeamInviteTokenMock.mockResolvedValueOnce("invite-1");
    sqlMock.mockResolvedValueOnce([
      {
        id: "invite-1",
        condominium_id: "condo-1",
        email: "ja@teste.com",
        role: "operador",
        accepted_at: null,
        expires_at: PAST_ISO,
        condominium_name: "Long Beach",
      },
    ]);

    const result = await getInviteDetails("token");

    expect(result.ok).toBe(false);
  });

  it("reports whether the invited e-mail already has an account", async () => {
    verifyTeamInviteTokenMock.mockResolvedValueOnce("invite-1");
    sqlMock.mockResolvedValueOnce([
      {
        id: "invite-1",
        condominium_id: "condo-1",
        email: "maria@teste.com",
        role: "visualizador",
        accepted_at: null,
        expires_at: FUTURE_ISO,
        condominium_name: "Long Beach",
      },
    ]);
    sqlMock.mockResolvedValueOnce([{ exists: 1 }]); // has account

    const result = await getInviteDetails("token");

    expect(result).toEqual({
      ok: true,
      condominiumName: "Long Beach",
      role: "visualizador",
      email: "maria@teste.com",
      hasAccount: true,
    });
  });
});

describe("acceptInviteForExistingUser", () => {
  function mockValidInviteRow(email = "maria@teste.com") {
    verifyTeamInviteTokenMock.mockResolvedValueOnce("invite-1");
    sqlMock.mockResolvedValueOnce([
      {
        id: "invite-1",
        condominium_id: "condo-1",
        email,
        role: "visualizador",
        accepted_at: null,
        expires_at: FUTURE_ISO,
        condominium_name: "Long Beach",
      },
    ]);
  }

  it("rejects when the logged-in session email does not match the invite", async () => {
    mockValidInviteRow("maria@teste.com");

    const result = await acceptInviteForExistingUser("token", "user-1", "outra@teste.com");

    expect(result.ok).toBe(false);
    expect(sqlMock).toHaveBeenCalledTimes(1);
  });

  it("grants access when the session e-mail matches (case-insensitive)", async () => {
    mockValidInviteRow("maria@teste.com");
    sqlMock.mockResolvedValueOnce([{ id: "link-1" }]); // atomic insert
    sqlMock.mockResolvedValueOnce([]); // mark accepted

    const result = await acceptInviteForExistingUser("token", "user-1", "Maria@Teste.com");

    expect(result.ok).toBe(true);
  });

  it("fails when the condominium already hit the limit at insert time", async () => {
    mockValidInviteRow("maria@teste.com");
    sqlMock.mockResolvedValueOnce([]); // atomic insert finds limit reached

    const result = await acceptInviteForExistingUser("token", "user-1", "maria@teste.com");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("limite");
  });
});

describe("acceptInviteForNewUser", () => {
  it("rejects a short password", async () => {
    verifyTeamInviteTokenMock.mockResolvedValueOnce("invite-1");
    sqlMock.mockResolvedValueOnce([
      {
        id: "invite-1",
        condominium_id: "condo-1",
        email: "novo@teste.com",
        role: "operador",
        accepted_at: null,
        expires_at: FUTURE_ISO,
        condominium_name: "Long Beach",
      },
    ]);

    const result = await acceptInviteForNewUser("token", "123", null);

    expect(result.ok).toBe(false);
  });

  it("rejects when an account was created for that e-mail in the meantime", async () => {
    verifyTeamInviteTokenMock.mockResolvedValueOnce("invite-1");
    sqlMock.mockResolvedValueOnce([
      {
        id: "invite-1",
        condominium_id: "condo-1",
        email: "novo@teste.com",
        role: "operador",
        accepted_at: null,
        expires_at: FUTURE_ISO,
        condominium_name: "Long Beach",
      },
    ]);
    sqlMock.mockResolvedValueOnce([{ id: "existing-user" }]);

    const result = await acceptInviteForNewUser("token", "senha12345", "Fulano");

    expect(result.ok).toBe(false);
  });

  it("creates the account and grants access on success", async () => {
    verifyTeamInviteTokenMock.mockResolvedValueOnce("invite-1");
    sqlMock.mockResolvedValueOnce([
      {
        id: "invite-1",
        condominium_id: "condo-1",
        email: "novo@teste.com",
        role: "operador",
        accepted_at: null,
        expires_at: FUTURE_ISO,
        condominium_name: "Long Beach",
      },
    ]);
    sqlMock.mockResolvedValueOnce([]); // no existing account
    sqlMock.mockResolvedValueOnce([{ id: "new-user" }]); // insert users
    sqlMock.mockResolvedValueOnce([{ id: "link-1" }]); // atomic insert
    sqlMock.mockResolvedValueOnce([]); // mark accepted

    const result = await acceptInviteForNewUser("token", "senha12345", "Fulano");

    expect(result).toEqual({ ok: true, userId: "new-user", email: "novo@teste.com" });
  });
});

describe("cancelInvite", () => {
  it("issues the delete scoped to the condominium and only pending invites", async () => {
    sqlMock.mockResolvedValueOnce([]);

    await cancelInvite("condo-1", "invite-1");

    expect(sqlMock).toHaveBeenCalledTimes(1);
  });
});

describe("removeTeamMember", () => {
  it("deletes the user_condominiums row for that pair", async () => {
    sqlMock.mockResolvedValueOnce([{ role: "operador" }]);
    sqlMock.mockResolvedValueOnce([]);

    const result = await removeTeamMember("condo-1", "user-1");

    expect(result.ok).toBe(true);
    expect(sqlMock).toHaveBeenCalledTimes(2);
  });

  it("refuses to remove a condominium admin", async () => {
    sqlMock.mockResolvedValueOnce([{ role: "admin" }]);

    const result = await removeTeamMember("condo-1", "user-1");

    expect(result.ok).toBe(false);
    expect(sqlMock).toHaveBeenCalledTimes(1);
  });

  it("returns an error when the user has no access to that condominium", async () => {
    sqlMock.mockResolvedValueOnce([]);

    const result = await removeTeamMember("condo-1", "user-1");

    expect(result.ok).toBe(false);
  });
});

describe("listTeam / countInvitedMembers", () => {
  it("listTeam maps rows to team members", async () => {
    sqlMock.mockResolvedValueOnce([
      { user_id: "u1", name: "Admin", email: "admin@teste.com", role: "admin" },
    ]);

    const team = await listTeam("condo-1");

    expect(team).toEqual([
      { userId: "u1", name: "Admin", email: "admin@teste.com", role: "admin" },
    ]);
  });

  it("countInvitedMembers returns the count from the query", async () => {
    sqlMock.mockResolvedValueOnce([{ count: 2 }]);

    expect(await countInvitedMembers("condo-1")).toBe(2);
  });
});
