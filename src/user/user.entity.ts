import { Perusahaan } from 'src/perusahaan/perusahaan.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column({unique: true})
  email: string;

  @Column()
  kata_sandi: string;

  @Column({default: "admin"})
  roles: "admin" | "user";

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Perusahaan, (p) => p.user, { onDelete: "CASCADE" })
  @JoinColumn()
  perusahaan: Perusahaan;
}
