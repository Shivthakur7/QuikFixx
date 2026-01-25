import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Global() // Make it global so DispatchModule can use it easily without cyclic issues
@Module({
    providers: [EventsGateway],
    exports: [EventsGateway],
})
export class EventsModule { }
