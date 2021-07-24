import { Worker } from "mediasoup/lib/Worker";
import { Router } from "mediasoup/lib/Router";

export default class MediasoupInstance {
  worker: Worker;
  router: Router;
}