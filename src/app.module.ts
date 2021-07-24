import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { WsGatewayService } from "./ws-gateway.service";
import { createWorker } from "mediasoup";
import { Router } from "mediasoup/lib/Router";
import config from "./config";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, WsGatewayService, {
    provide: Router,
    useFactory: AppModule.mediasoupInitialization
  }]
})
export class AppModule {

  static async mediasoupInitialization() {
    const worker = await createWorker();
    // @ts-ignore
    return await worker.createRouter({ mediaCodecs: config.mediaCodecs });
  }

}
