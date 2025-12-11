import Decimal from "decimal.js";
import {
    OCTA_MULTIPLIER,
    ADDRESS_MIN_LENGTH_FOR_TRUNCATION,
    ADDRESS_PREFIX_LENGTH,
    ADDRESS_SUFFIX_LENGTH,
    THOUSAND,
    MILLION,
    BILLION,
    TRILLION
} from '../constants';

export const FormatEdsAmount = (amount: Decimal): string => {
    return amount.div(OCTA_MULTIPLIER).toFixed(2)
}
export const FormatAmount = (amount: Decimal, decimals: number | string): Decimal => {
    const divisor = new Decimal(10).pow(decimals);
    return amount.div(divisor)
}
export const WithDecimal = (amount: string, decimals: number | string): Decimal => {
    const divisor = new Decimal(10).pow(decimals);
    return new Decimal(amount).mul(divisor)
}
export const FormatAddress = (addr: string): string => {
    if (addr.length < ADDRESS_MIN_LENGTH_FOR_TRUNCATION) {
        return addr
    }
    return addr.substring(0, ADDRESS_PREFIX_LENGTH) + "..." + addr.substring(addr.length - ADDRESS_SUFFIX_LENGTH)
}

export const FormatCoinName = (coinName:string):string=>{
    if (coinName.length<=ADDRESS_MIN_LENGTH_FOR_TRUNCATION){
        return coinName
    }else{
        return coinName.substring(0, ADDRESS_MIN_LENGTH_FOR_TRUNCATION-1)
    }
}

export const FormatSupply = (number: Decimal, decimals: number): string => {
    const divisor = new Decimal(10).pow(decimals);
    const s = number.div(divisor)
    if (s.lte(THOUSAND)) {
        return s.toString()
    } else if (s.lte(MILLION)) {
        return s.div(THOUSAND) + "k"
    } else if (s.lte(BILLION)) {
        return s.div(MILLION) + "M"
    } else if (s.lte(TRILLION)) {
        return s.div(BILLION) + "B"
    } else {
        return s.div(TRILLION) + "T"
    }
}
