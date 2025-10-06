import { queryString, request } from "./request";

import { FacilityOrganization } from "@/types/organization";
import { FacilityUser } from "@/types/user";
import { PaginatedResponse } from "./types";
import { Role } from "@/types/role";

export const apis = {
  organizations: {
    list: async (
      facilityId: string,
      query?: {
        limit?: number;
        offset?: number;
        parent?: string;
        level_cache?: number;
      }
    ) => {
      return await request<PaginatedResponse<FacilityOrganization>>(
        `/api/v1/facility/${facilityId}/organizations/` + queryString(query)
      );
    },

    users: {
      list: async (
        facilityId: string,
        organizationId: string,
        query?: {
          limit?: number;
          offset?: number;
          role?: string;
        }
      ) => {
        return await request<PaginatedResponse<FacilityUser>>(
          `/api/v1/facility/${facilityId}/organizations/${organizationId}/users/` +
            queryString(query)
        );
      },
    },
  },

  roles: {
    list: async () => {
      return await request<PaginatedResponse<Role>>("/api/v1/role/");
    },
  },
};
