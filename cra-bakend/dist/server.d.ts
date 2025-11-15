import app from './app';
declare const server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
declare const webSocketService: import("./services/websocketNotification.service").WebSocketNotificationService;
export { server, app, webSocketService };
export default server;
//# sourceMappingURL=server.d.ts.map