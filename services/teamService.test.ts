import { beforeEach, describe, expect, it, vi } from "vitest";

const sqlMock = vi.fn();
const sendEmailMock = vi.fn();
const createResetTokenMock = vi.fn();

vi.mock("@/lib/db", () => ({ sql: sqlMock }));
vi.mock("@/lib/email", () => ({ sendEmail: sendEmailMock }));
vi.mock("@/lib/passwordReset", () => ({ createResetToken: createResetTokenMock }));

const {
  inviteTeamMember,
  removeTeamMember,
  listTeam,
  countInvitedMembers,
  isInvitableRole,
  MAX_INVITED_TEAM_MEMBERS,
} = await import("./teamService");

beforeEach(() => {
  sqlMock.mockReset();
  sendEmailMock.mockReset();
  createResetTokenMock.mockReset();
  createResetTokenMock.mockResolvedValue("fake-token");
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

describe("inviteTeamMember", () => {
  it("rejects an attempt to invite as admin", async () => {
    const result = await inviteTeamMember("condo-1", "novo@teste.com", "admin" as never, "https://hydro-pulse.example");

    expect(result.ok).toBe(false);
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it("rejects once the condominium already has the max invited members", async () => {
    sqlMock.mockResolvedValueOnce([{ count: MAX_INVITED_TEAM_MEMBERS }]);

    const result = await inviteTeamMember("condo-1", "novo@teste.com", "operador", "https://hydro-pulse.example");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("limite");
    }
  });

  it("rejects when the email already has access to this condominium", async () => {
    sqlMock.mockResolvedValueOnce([{ count: 0 }]); // countInvitedMembers
    sqlMock.mockResolvedValueOnce([{ name: "Long Beach" }]); // condominium name
    sqlMock.mockResolvedValueOnce([{ id: "u1", name: "Já Existe", email: "ja@teste.com" }]); // existing user
    sqlMock.mockResolvedValueOnce([{ exists: true }]); // already linked

    const result = await inviteTeamMember("condo-1", "ja@teste.com", "operador", "https://hydro-pulse.example");

    expect(result.ok).toBe(false);
  });

  it("links an existing user and notifies them by email without a reset token", async () => {
    sqlMock.mockResolvedValueOnce([{ count: 0 }]);
    sqlMock.mockResolvedValueOnce([{ name: "Long Beach" }]);
    sqlMock.mockResolvedValueOnce([{ id: "u1", name: "Maria", email: "maria@teste.com" }]);
    sqlMock.mockResolvedValueOnce([]); // not yet linked
    sqlMock.mockResolvedValueOnce([]); // insert into user_condominiums

    const result = await inviteTeamMember("condo-1", "maria@teste.com", "visualizador", "https://hydro-pulse.example");

    expect(result.ok).toBe(true);
    expect(createResetTokenMock).not.toHaveBeenCalled();
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
  });

  it("creates a brand-new user and sends an invite link when the email is unknown", async () => {
    sqlMock.mockResolvedValueOnce([{ count: 1 }]);
    sqlMock.mockResolvedValueOnce([{ name: "Long Beach" }]);
    sqlMock.mockResolvedValueOnce([]); // no existing user
    sqlMock.mockResolvedValueOnce([{ id: "new-user" }]); // insert into users
    sqlMock.mockResolvedValueOnce([]); // insert into user_condominiums

    const result = await inviteTeamMember("condo-1", "novo@teste.com", "sindico", "https://hydro-pulse.example");

    expect(result.ok).toBe(true);
    expect(createResetTokenMock).toHaveBeenCalledWith("new-user", 7 * 24 * 60 * 60);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
  });
});

describe("removeTeamMember", () => {
  it("deletes the user_condominiums row for that pair", async () => {
    sqlMock.mockResolvedValueOnce([{ role: "operador" }]); // current role lookup
    sqlMock.mockResolvedValueOnce([]); // delete

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
