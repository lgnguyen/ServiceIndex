export {
    createRequireAuth,
    requireJsonBody,
    sendValidationError,
    sendAuthError,
    type AuthConfig,
} from "./base";
export {
    validateCreateUserBody,
    validateUserIdMatchesAuth,
} from "./users";
export {
    validateCreateVehicleBody,
    validateUpdateVehicleBody,
    validateVehicleIdParam,
} from "./vehicles";
export {
    validateCreateServiceRecordBody,
    validateUpdateServiceRecordBody,
    validateServiceRecordIdParam,
} from "./service-records";
export {
    validateCreateAlertBody,
    validateUpdateAlertBody,
    validateAlertIdParam,
} from "./alerts";
