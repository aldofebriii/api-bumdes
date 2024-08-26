import Transaksi from 'src/transaksi/transaksi.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type StatusPihak = 'kreditur' | 'debitur';

@Entity()
export default class Pihak {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column('timestamp')
  jatuh_tempo_awal: string;

  @Column('timestamp')
  jatuh_tempo_akhir: string;

  /**
   * @abstract kreditur mengarah pada penerima utang dan debitur pemberi utang.
   */
  @Column()
  status: StatusPihak;

  @Column('double')
  jumlah: number;

  @OneToOne(() => Transaksi)
  @JoinColumn()
  transaksi: Transaksi;
}
