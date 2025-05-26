"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const nest_winston_1 = require("nest-winston");
const winston = require("winston");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: nest_winston_1.WinstonModule.createLogger({
            transports: [new winston.transports.File({ filename: 'app.log' })],
        }),
    });
    const config = app.get(config_1.ConfigService);
    const port = config.get('PORT') || 3000;
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map