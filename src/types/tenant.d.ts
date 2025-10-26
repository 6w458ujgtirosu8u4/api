type TenantStatus = "inactive" | "active" | "pending";

interface Tenant {
  tid: string;
  name: string;
  slug: string;
  status: TenantStatus;
  created_at: Date;
  updated_at: Date | null;
}

type TenantFields = Omit<Tenant, "tid" | "created_at" | "updated_at">;

interface TenantRow extends Omit<Tenant, "status" | "created_at" | "updated_at"> {
  status: number;
  created_at: string;
  updated_at?: string;
}

type TenantBody = Omit<TenantRow, "tid" | "created_at" | "updated_at">;
