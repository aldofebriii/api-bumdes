import Transaksi from 'src/transaksi/transaksi.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class ChartOfAccounts {
  @PrimaryColumn()
  kode: string;

  @Column()
  nama_akun: string;

  @Column({ type: 'varchar', length: 6 })
  posisi_normal: 'debit' | 'kredit';

  @OneToMany(() => Akun, (akun) => akun.kode_akun)
  akun: Akun[];
}

@Entity()
export class Akun {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ChartOfAccounts, (coa) => coa.akun)
  @JoinColumn()
  kode_akun: ChartOfAccounts | string;

  @Column({ type: 'varchar', length: 6 })
  posisi: 'debit' | 'kredit';

  @Column('double')
  jumlah: number;

  @Column('varchar', { nullable: true })
  keterangan: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Transaksi, (t) => t.akun)
  @JoinColumn()
  transaksi: Transaksi;
}
