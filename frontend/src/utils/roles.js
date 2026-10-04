// Which roles may open which page. Keep in sync with the role checks in backend/src/routes.
const ALL = ["owner", "doctor", "receptionist", "nurse"];

export const PAGE_ROLES = {
  "/": ALL,
  "/patients": ALL,
  "/appointments": ALL,
  "/queue": ALL,
  "/opd": ["owner", "doctor"],
  "/labtests": ALL,
  "/medicines": ALL,
  "/billing": ["owner", "doctor", "receptionist"],
  "/staff": ["owner"],
  "/expenses": ["owner"],
  "/analytics": ["owner"],
  "/settings": ["owner"],
};

export const canAccess = (role, path) => (PAGE_ROLES[path] || ALL).includes(role);
