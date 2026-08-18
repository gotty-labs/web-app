import type { StaticImageData } from 'next/image'

import acbG from '@/public/assets/images/age-rating/acb_g.png'
import acbM from '@/public/assets/images/age-rating/acb_m.png'
import acbMa15Plus from '@/public/assets/images/age-rating/acb_ma_15_plus.png'
import acbPg from '@/public/assets/images/age-rating/acb_pg.png'
import acbR18Plus from '@/public/assets/images/age-rating/acb_r_18_plus.png'
import acbRc from '@/public/assets/images/age-rating/acb_rc.png'
import type { GameAgeRating } from '@/lib/domain/enums'
import ceroA from '@/public/assets/images/age-rating/cero_a.png'
import ceroB from '@/public/assets/images/age-rating/cero_b.png'
import ceroC from '@/public/assets/images/age-rating/cero_c.png'
import ceroD from '@/public/assets/images/age-rating/cero_d.png'
import ceroZ from '@/public/assets/images/age-rating/cero_z.png'
import classInd10 from '@/public/assets/images/age-rating/classind_10.png'
import classInd12 from '@/public/assets/images/age-rating/classind_12.png'
import classInd14 from '@/public/assets/images/age-rating/classind_14.png'
import classInd16 from '@/public/assets/images/age-rating/classind_16.png'
import classInd18 from '@/public/assets/images/age-rating/classind_18.png'
import classIndL from '@/public/assets/images/age-rating/classind_l.png'
import esrbAo from '@/public/assets/images/age-rating/esrb_ao.png'
import esrbE from '@/public/assets/images/age-rating/esrb_e.png'
import esrbE10Plus from '@/public/assets/images/age-rating/esrb_e10_plus.png'
import esrbEc from '@/public/assets/images/age-rating/esrb_ec.png'
import esrbM from '@/public/assets/images/age-rating/esrb_m.png'
import esrbRp from '@/public/assets/images/age-rating/esrb_rp.png'
import esrbT from '@/public/assets/images/age-rating/esrb_t.png'
import grac12Plus from '@/public/assets/images/age-rating/grac_12_plus.png'
import grac15Plus from '@/public/assets/images/age-rating/grac_15_plus.png'
import grac19Plus from '@/public/assets/images/age-rating/grac_19_plus.png'
import gracAll from '@/public/assets/images/age-rating/grac_all.png'
import gracTesting from '@/public/assets/images/age-rating/grac_testing.png'
import pegi12 from '@/public/assets/images/age-rating/pegi_12.png'
import pegi16 from '@/public/assets/images/age-rating/pegi_16.png'
import pegi18 from '@/public/assets/images/age-rating/pegi_18.png'
import pegi3 from '@/public/assets/images/age-rating/pegi_3.png'
import pegi7 from '@/public/assets/images/age-rating/pegi_7.png'
import usk0 from '@/public/assets/images/age-rating/usk_0.png'
import usk6 from '@/public/assets/images/age-rating/usk_6.png'
import usk12 from '@/public/assets/images/age-rating/usk_12.png'
import usk16 from '@/public/assets/images/age-rating/usk_16.png'
import usk18 from '@/public/assets/images/age-rating/usk_18.png'

type AgeRatingImage = StaticImageData

/**
 * Every rating value currently produced by the backend mapped to its alpha-trimmed
 * board asset. Next supplies each imported asset's intrinsic dimensions, so the
 * component can preserve its aspect ratio without duplicating image metadata here.
 * A null entry is intentional: the UI can safely omit a known value when there is no
 * matching asset yet.
 */
export const AGE_RATING_IMAGE_MAP: Readonly<
  Record<GameAgeRating, Readonly<Record<string, AgeRatingImage | null>>>
> = {
  ESRB: {
    RP: esrbRp,
    EC: esrbEc,
    E: esrbE,
    'E10+': esrbE10Plus,
    T: esrbT,
    M: esrbM,
    AO: esrbAo,
  },
  PEGI: {
    '3': pegi3,
    '7': pegi7,
    '12': pegi12,
    '16': pegi16,
    '18': pegi18,
  },
  CERO: {
    A: ceroA,
    B: ceroB,
    C: ceroC,
    D: ceroD,
    Z: ceroZ,
  },
  USK: {
    '0': usk0,
    '6': usk6,
    '12': usk12,
    '16': usk16,
    '18': usk18,
  },
  GRAC: {
    ALL: gracAll,
    '12+': grac12Plus,
    '15+': grac15Plus,
    '19+': grac19Plus,
    TESTING: gracTesting,
    '18+': null,
  },
  CLASS_IND: {
    L: classIndL,
    '10': classInd10,
    '12': classInd12,
    '14': classInd14,
    '16': classInd16,
    '18': classInd18,
  },
  ACB: {
    G: acbG,
    PG: acbPg,
    M: acbM,
    'MA 15+': acbMa15Plus,
    'R 18+': acbR18Plus,
    RC: acbRc,
  },
}

export function getAgeRatingImage(
  organization: GameAgeRating,
  rate: string,
): StaticImageData | null {
  return AGE_RATING_IMAGE_MAP[organization]?.[rate] ?? null
}
