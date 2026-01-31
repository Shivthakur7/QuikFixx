import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Provider } from './provider.entity';
import { Order } from './order.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'int' })
    rating: number; // 1 to 5

    @Column({ type: 'text', nullable: true })
    comment: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'customer_id' })
    customer: User;

    @Column({ name: 'customer_id', type: 'uuid' })
    customerId: string;

    @ManyToOne(() => Provider)
    @JoinColumn({ name: 'provider_id' })
    provider: Provider;

    @Column({ name: 'provider_id', type: 'uuid' })
    providerId: string;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column({ name: 'order_id', type: 'uuid' })
    orderId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
