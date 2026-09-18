import { beforeEach, describe, expect, it, vi } from "vitest";

const sqlMock = vi.fn();

vi.mock("@/lib/db", () => ({ sql: sqlMock }));

const { listContactsByCondominium, createContact, deleteContact } = await import(
  "./contactService"
);

beforeEach(() => {
  sqlMock.mockReset();
});

describe("contactService", () => {
  it("listContactsByCondominium maps snake_case rows to camelCase", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: "c1",
        condominium_id: "condo-1",
        name: "Zelador João",
        phone_number: "(11) 91234-5678",
        created_at: "2026-01-01T00:00:00Z",
      },
    ]);

    const contacts = await listContactsByCondominium("condo-1");

    expect(contacts).toEqual([
      {
        id: "c1",
        condominiumId: "condo-1",
        name: "Zelador João",
        phoneNumber: "(11) 91234-5678",
        createdAt: "2026-01-01T00:00:00Z",
      },
    ]);
  });

  it("createContact returns the inserted row mapped", async () => {
    sqlMock.mockResolvedValueOnce([
      {
        id: "c2",
        condominium_id: "condo-1",
        name: "Síndica Maria",
        phone_number: "(11) 98888-7777",
        created_at: "2026-01-02T00:00:00Z",
      },
    ]);

    const contact = await createContact("condo-1", {
      name: "Síndica Maria",
      phoneNumber: "(11) 98888-7777",
    });

    expect(contact.id).toBe("c2");
    expect(contact.condominiumId).toBe("condo-1");
  });

  it("deleteContact issues the delete query", async () => {
    sqlMock.mockResolvedValueOnce([]);

    await deleteContact("c1");

    expect(sqlMock).toHaveBeenCalledTimes(1);
  });
});
