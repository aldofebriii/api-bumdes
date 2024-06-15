import { Akun } from 'src/akun/akun.entity';
import { Perusahaan } from 'src/perusahaan/perusahaan.entity';
import Debitur from 'src/utang/debitur.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export default class Transaksi {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Perusahaan, (p) => p.transaksi)
  @JoinColumn()
  perusahaan: Perusahaan;

  @OneToMany(() => Akun, (akun) => akun.transaksi, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  akun: Akun[];

  @Column('timestamp')
  tanggal: string;

  @Column('int')
  nomor: number;

  @Column('double')
  jumlah: number;

  @Column('varchar', { nullable: true })
  keterangan: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
