"use strict";
// src/types/chat.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = exports.ChannelMemberRole = exports.ChannelType = void 0;
// =============================================
// ENUMS
// =============================================
var ChannelType;
(function (ChannelType) {
    ChannelType["GENERAL"] = "GENERAL";
    ChannelType["PROJECT"] = "PROJECT";
    ChannelType["THEME"] = "THEME";
    ChannelType["PRIVATE"] = "PRIVATE";
    ChannelType["ANNOUNCEMENT"] = "ANNOUNCEMENT";
})(ChannelType || (exports.ChannelType = ChannelType = {}));
var ChannelMemberRole;
(function (ChannelMemberRole) {
    ChannelMemberRole["OWNER"] = "OWNER";
    ChannelMemberRole["ADMIN"] = "ADMIN";
    ChannelMemberRole["MODERATOR"] = "MODERATOR";
    ChannelMemberRole["MEMBER"] = "MEMBER";
})(ChannelMemberRole || (exports.ChannelMemberRole = ChannelMemberRole = {}));
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["FILE"] = "FILE";
    MessageType["IMAGE"] = "IMAGE";
    MessageType["SYSTEM"] = "SYSTEM";
})(MessageType || (exports.MessageType = MessageType = {}));
//# sourceMappingURL=chat.types.js.map