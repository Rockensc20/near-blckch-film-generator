// 0.5 NEAR in YoctoNEAR as smart contracts always calculate in YoctoNEAR
export const POINT_FIVE = '500000000000000000000000';

export class GeneratedFilmCombination {
    size: string;
    format: string;
    iso: string;
  
    /**
    * Generates a new film combination based on specified parameters.
    * @returns {GeneratedFilmCombination} A new film combination.
    */
    constructor(size: string, format: string, iso: string) {
      this.size = size;
      this.format = format;
      this.iso = iso;
    }
  
};

export class SavedFilmCombination {
    analogSupporter: boolean;
    photographer: string;
    size: string;
    format: string;
    iso: string;
    camera: string;
    date: Date;
    
    /**
    * Model for saving a new film combination including the camera, date, photographer and whether they donated to the contract's dev
    * @returns {SavedFilmCombination} A film combination after it is saved.
    */

    constructor({analogSupporter,photographer, size, format, iso, camera, date }: SavedFilmCombination) {
      
      this.analogSupporter = analogSupporter
      this.photographer = photographer;
      this.size = size;
      this.format = format;
      this.iso = iso;
      this.camera = camera;
      this.date = date;
    }
    
  }
  