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

  @Column({ unique: true })
  nama: string;

  @Column()
  alamat: string;

  @Column()
  email: string;

  @Column()
  kata_sandi: string;

  @Column()
  roles: "admin" | "user"

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Perusahaan, (p) => p.user, { onDelete: "CASCADE" })
  @JoinColumn()
  perusahaan: Perusahaan;
}
