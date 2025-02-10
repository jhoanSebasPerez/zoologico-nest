import { applyDecorators, UseGuards } from "@nestjs/common";
import { ValidRoles } from "../types";
import { RoleProtected } from "./role-protected.decorator";
import { UserRoleGuard } from "../guards/user-role.guard";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

export function Auth(...roles: ValidRoles[]) {
    return applyDecorators(
        RoleProtected(...roles),
        UseGuards(JwtAuthGuard, UserRoleGuard)
    );
}