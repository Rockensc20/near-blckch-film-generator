// documentation at https://docs.near.org
import { NearBindgen, near, call, view, Vector } from 'near-sdk-js';
import { GeneratedFilmCombination,SavedFilmCombination, POINT_FIVE } from './model'
import Rand, { PRNG } from 'rand-seed'; 

// helper function to take care of random generation and value definition
function generateNewFilmCombination(): GeneratedFilmCombination {
  
  // define possible values for film size, format, and ISO
  const sizes = ["135", "120"];
  const formats = ["Color", "BnW"];
  const isoValues = ["25", "32", "50", "100", "125", "160", "200", "400", "800", "1600", "3200"];
  
  // use NEAR random seed for seeding the random number generator,
  // which will then be used to pick random values from the arrays above
  const rand = new Rand(near.randomSeed().toString())
  
  // randomly select values for size, format, and ISO
  const randomSize = sizes[Math.floor(rand.next() * sizes.length)];
  //near.log(randomSize);
  const randomFormat = formats[Math.floor(rand.next() * formats.length)];
  //near.log(randomFormat);
  const randomIso = isoValues[Math.floor(rand.next() * isoValues.length)];
  //near.log(randomIso);
  
  const generatedFilmCombination = new GeneratedFilmCombination(randomSize,randomFormat,randomIso);
  return generatedFilmCombination;
}

// ### The Film Combination Generator###

// Annotation for declaring a NEAR contract
@NearBindgen({})
class FilmGeneratorNear {
  film_combinations: Vector<SavedFilmCombination> =  new Vector<SavedFilmCombination>("v-uid");
  
  // view functions are read-only, no transaction fees
  @view({})
  // Returns the last 10 saved film combinations, any older than that and they have to be viewed on the Blockchain explorer
  get_film_combinations({ from_index = 0, limit = 10 }: { from_index: number, limit: number }): SavedFilmCombination[] {
    const sorted_film_combinations = this.film_combinations.toArray().sort((a, b) => b.date.getTime() - a.date.getTime());
    return sorted_film_combinations.slice(from_index, from_index + limit);
  }

  // call functions require tokens for the transfer/storage cost
  @call({ payableFunction: true })
  // Public - Saves a generated film combination to the blockchain
  save_film_combination({ size, format, iso, camera, date }: { size: string,format: string,iso: string,camera: string, date: string }) {
    // If the user attaches more than 0.1N the message is premium
    const analogSupporter = near.attachedDeposit() >= BigInt(POINT_FIVE);
    const photographer = near.predecessorAccountId();
    const dateConverted = new Date(date);

    const SavedFilmCombination: SavedFilmCombination = { analogSupporter, photographer,size, format, iso, camera,date: dateConverted };
    this.film_combinations.push(SavedFilmCombination);
  }

  @view({})
  // Returns a freshly generated, random film combination
  get_film_combination(): GeneratedFilmCombination { 
    return generateNewFilmCombination();
  }

  // essentially a regular transaction to donate attached deposit to a photographer (ex. from the list in the fronted)
  @call({ payableFunction: true })
  donate_to_photographer({photographerToDonateTo}: { photographerToDonateTo: string}) {
      // Get who is calling the method and how much $NEAR they attached
      let donor = near.predecessorAccountId();
      let donationAmount: bigint = near.attachedDeposit() as bigint;
  
      let toTransfer = donationAmount;
  
      near.log(`Thank you ${donor} for donating ${donationAmount} to ${photographerToDonateTo}! You have supported their analog journey with digital currency`);
  
      // Send the money to the beneficiary
      const promise = near.promiseBatchCreate(photographerToDonateTo)
      near.promiseBatchActionTransfer(promise, toTransfer)
  }
}