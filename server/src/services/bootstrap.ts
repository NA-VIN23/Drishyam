import prisma from "../config/db";

const CORE_ROLES = [
  { key: "ADMIN", name: "Administrator", description: "Full system access" },
  { key: "MANAGER", name: "Manager", description: "Reporting and oversight" },
  { key: "TECHNICIAN", name: "Technician", description: "Maintenance execution" },
  { key: "ENGINEER", name: "Engineer", description: "Aircraft inspection and maintenance planning" },
  { key: "OPERATIONS", name: "Operations Officer", description: "Scheduling and allocation" },
];

export async function bootstrapCoreRoles() {
  // 1. Upsert current core roles
  const roles = await Promise.all(
    CORE_ROLES.map((role) =>
      prisma.role.upsert({
        where: { key: role.key },
        update: {
          name: role.name,
          description: role.description,
        },
        create: role,
      }),
    ),
  );

  const engineerRole = roles.find((r) => r.key === "ENGINEER");

  if (engineerRole) {
    // 2. Locate legacy SAFETY_OFFICER role
    const legacyRole = await prisma.role.findUnique({
      where: { key: "SAFETY_OFFICER" },
    });

    if (legacyRole) {
      // 3. Migrate users with legacy SAFETY_OFFICER to ENGINEER
      await prisma.user.updateMany({
        where: { roleId: legacyRole.id },
        data: { roleId: engineerRole.id },
      });

      // 4. Delete legacy SAFETY_OFFICER role
      await prisma.role.delete({
        where: { id: legacyRole.id },
      });
    }
  }
}

export async function getDefaultRoleKey() {
  return "TECHNICIAN";
}