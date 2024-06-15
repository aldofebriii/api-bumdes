import Transaksi from 'src/transaksi/transaksi.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export default class Debitur {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama_debitur: string;

  @Column('timestamp')
  jatuh_tempo_awal: string;

  @Column('timestamp')
  jatuh_tempo_akhir: string;

  @OneToOne(() => Transaksi)
  @JoinColumn()
  transaksi: Transaksi;
}
