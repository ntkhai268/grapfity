import { Essentia, EssentiaWASM } from "essentia.js"
import fs from "fs"
import decode from "audio-decode"
const essentia = new Essentia(EssentiaWASM)

const decodeAudio = async (filepath) => {
    const buffer = fs.readFileSync(filepath);
    const audio = await decode(buffer);
    const audioVector = essentia.arrayToVector(audio._channelData[0]);
    return audioVector;
};

const feature_extreaction = async () => {
    const KEYS = ["C", "D", "E", "F", "G", "A", "B"];
    const path = "public/assets/track_mp3/1745608379123-Calm_Like_a_Bomb.mp3";
    const data = await decodeAudio(path);
    const danceability = essentia.Danceability(data).danceability;
    const duration = essentia.Duration(data).duration;
    const energy = essentia.Energy(data).energy;

    const computedKey = essentia.KeyExtractor(data);
    const key = KEYS.indexOf(computedKey.key);
    const mode = computedKey.scale === "major" ? 1 : 0;

    const loudness = essentia.DynamicComplexity(data).loudness;
    const tempo = essentia.PercivalBpmEstimator(data).bpm;

    const features = ({
        danceability,
        duration,
        energy,
        key,
        mode,
        loudness,
        tempo,
    })
    return features
};

export { feature_extreaction }
