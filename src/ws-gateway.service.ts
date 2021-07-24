import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Router } from "mediasoup/lib/Router";

@WebSocketGateway({ cors: ["*"] })
export class WsGatewayService implements OnGatewayConnection<Socket> {

  @WebSocketServer()
  server: Server;

  constructor(private readonly router: Router) {
  }

  handleConnection(client: Socket, ...args: any[]): any {
    client.data = {};
  }

  @SubscribeMessage("initializeConnection")
  async initializeConnection(client: Socket): Promise<any> {
    const webRtcTransportOptions = {
      listenIps: [{ ip: "192.168.1.4" }],
      enableTcp: true,
      preferUdp: true
    };
    // client producer
    client.data.sendTransport = await this.router.createWebRtcTransport(webRtcTransportOptions);
    // client consumer
    client.data.recvTransport = await this.router.createWebRtcTransport(webRtcTransportOptions);

    return {
      routerRtpCapabilities: this.router.rtpCapabilities,
      send: {
        id: client.data.sendTransport.id,
        iceParameters: client.data.sendTransport.iceParameters,
        iceCandidates: client.data.sendTransport.iceCandidates,
        dtlsParameters: client.data.sendTransport.dtlsParameters,
        sctpParameters: client.data.sendTransport.sctpParameters
      },
      recv: {
        id: client.data.recvTransport.id,
        iceParameters: client.data.recvTransport.iceParameters,
        iceCandidates: client.data.recvTransport.iceCandidates,
        dtlsParameters: client.data.recvTransport.dtlsParameters,
        sctpParameters: client.data.recvTransport.sctpParameters
      }
    };
  }

  @SubscribeMessage("connectTransport")
  async connectSendTransport(client, { type, dtlsParameters }) {
    if (type === "send") {
      await client.data.sendTransport.connect({ dtlsParameters });
    } else if (type === "recv") {
      await client.data.recvTransport.connect({ dtlsParameters });
    }
    return 0;
  }

  @SubscribeMessage("createProducer")
  async createProducer(client, payload) {
    client.data.producer = await client.data.sendTransport.produce(payload);
    return { id: client.data.producer.id };
  }

  @SubscribeMessage("createConsumer")
  async createConsumer(client, payload) {
    client.data.consumer = await client.data.recvTransport.consume({ ...payload, paused: true });
    return {
      id: client.data.consumer.id,
      rtpParameters: client.data.consumer.rtpParameters,
      kind: client.data.consumer.kind,
      appData: client.data.consumer.appData
    };
  }

  @SubscribeMessage("resumeConsumer")
  async resumeConsumer(client: Socket) {
    await client.data.consumer.resume();
    return 0;
  }

}
