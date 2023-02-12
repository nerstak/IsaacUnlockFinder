import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
/**
 * Service whose goal is, from a FileReader, determine and extract the correct Repentance save file
 * Check out this link for the original source code: https://github.com/Zamiell/isaac-save-viewer/blob/f073d8f2599284ff7c465f1565f44840dc5f8c3d/src/readFile.ts
 */
export class SaveFileValidatorService {
  HEADER_LENGTH = 16;


  // Run files are ones that contain data for a run that has been exited mid-way through.
  // e.g. gamestate1.dat
  REBIRTH_RUN_HEADER = "ISAACNG_GSR0018";
  AFTERBIRTH_RUN_HEADER = "ISAACNG_GSR0034";
  AFTERBIRTH_PLUS_RUN_HEADER = "ISAACNG_GSR0065";
  REPENTANCE_RUN_HEADER = "ISAACNG_GSR0142";
  RUN_HEADERS = new Set([
    this.REBIRTH_RUN_HEADER,
    this.AFTERBIRTH_RUN_HEADER,
    this.AFTERBIRTH_PLUS_RUN_HEADER,
    this.REPENTANCE_RUN_HEADER,
  ]);

  // Persistent files are ones that contain data for the entire save file.
  // e.g. persistentgamedata1.dat
  REBIRTH_PERSISTENT_HEADER = "ISAACNGSAVE06R";
  AFTERBIRTH_PERSISTENT_HEADER = "ISAACNGSAVE08R";
  AFTERBIRTH_PLUS_AND_REPENTANCE_PERSISTENT_HEADER = "ISAACNGSAVE09R";


  // Afterbirth+ actually has 403 achievements, but the size of the array is 404 because there is no
  // 0th achievement.
  NUM_AFTERBIRTH_PLUS_ACHIEVEMENTS = 404;

  constructor() {
  }

  /**
   * Verify that file in File Reader is an Isaac Save File, for Repentance
   * @param fr File Reader loaded with a Repentance save file
   */
  verify(fr: FileReader): IsaacSaveFile {
    const arrayBuffer: string | ArrayBuffer | null = fr.result;
    if (arrayBuffer === null || typeof arrayBuffer === "string") {
      throw new Error("The file array buffer was an unknown type.");
    }

    this.verifyHeader(arrayBuffer);

    // The format of the save file was reversed by Blade using: https://ide.kaitai.io/
    // It produces a JavaScript decoder that we leverage here
    const kaitaiStream = new KaitaiStream(arrayBuffer);
    const isaacSaveFile = new IsaacSaveFile(kaitaiStream);

    this.verifyNotAfterbirthPlus(isaacSaveFile);

    return isaacSaveFile;
  }

  /**
   * Verify that header from save file are the ones of Repentance
   * Throw if error
   *
   * It is done before parsing in order to generate better error messages
   *
   * @param arrayBuffer
   */
  verifyHeader(arrayBuffer: ArrayBuffer) {
    const headerBytes = arrayBuffer.slice(0, this.HEADER_LENGTH);
    const header = this.arrayBufferToString(headerBytes);

    if (this.RUN_HEADERS.has(header)) {
      throw new Error(
        'That is a file that stores the temporary game state for a specific run.<br />You need to instead select the "persistent" file that contains the data for the entire save file.',
      );
    }

    if (header === this.REBIRTH_PERSISTENT_HEADER) {
      this.errorWrongGameType("Rebirth");
    } else if (header === this.AFTERBIRTH_PERSISTENT_HEADER) {
      this.errorWrongGameType("Afterbirth");
    }

    if (header !== this.AFTERBIRTH_PLUS_AND_REPENTANCE_PERSISTENT_HEADER) {
      console.error("Unknown header:");
      console.error(header);
      throw new Error(
        "That is not a valid save file for <i>The Binding of Isaac: Repentance</i>.",
      );
    }
  }

  /**
   * Convert an ArrayBuffer to string
   * @param arrayBuffer ArrayBuffer to convert
   */
  arrayBufferToString(arrayBuffer: ArrayBuffer) {
    const textDecoder = new TextDecoder("utf-8");
    const string = textDecoder.decode(arrayBuffer).trim();
    return this.removeNullCharacters(string).trim();
  }

  /**
   * Remove Null Characters in a string
   * @param string String to clean
   */
  removeNullCharacters(string: string) {
    return string.replace("\0", "");
  }

  /**
   * Verify that save file is not an Afterbirth+ one
   * Throw on error
   *
   * Needed because AB+ & Rep have same header
   *
   * @param isaacSaveFile
   */
  verifyNotAfterbirthPlus(isaacSaveFile: IsaacSaveFile) {
    // eslint-disable-next-line isaacscript/strict-enums
    const chunk = isaacSaveFile.chunks[ChunkType.ACHIEVEMENTS - 1];
    if (chunk === undefined) {
      throw new Error("Failed to get the achievements chunk.");
    }

    if (chunk.len === this.NUM_AFTERBIRTH_PLUS_ACHIEVEMENTS) {
      this.errorWrongGameType("Afterbirth+");
    }
  }

  /**
   * Throw customized error
   * @param gameType Recognized save file game
   */
  errorWrongGameType(gameType: string) {
    throw new Error(
      `That is a save file for <i>The Binding of Isaac: ${gameType}</i>.<br />This site only supports save files for <i>The Binding of Isaac: Repentance</i>.`,
    );
  }
}
