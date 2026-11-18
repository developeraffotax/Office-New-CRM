import { useEffect, useState } from "react";
import { kbHttp as api } from "../../aiApi.js";

// Role names come from your Role collection (cached after the first fetch).
let rolesPromise;

export default function useRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    rolesPromise ??= api.get("/roles").then((r) => r.data);
    rolesPromise
      .then(setRoles)
      .catch(() => { rolesPromise = undefined; })
      .finally(() => setLoading(false));
  }, []);
  return { roles, loading };
}
