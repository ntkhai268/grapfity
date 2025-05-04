import { feature_extreaction } from "../services/metadata_service.js"; 

const feature_extraction = async (req, res) => {
    try{
        const features = await feature_extreaction()
        res.status(200).json(features);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }    
}

export { feature_extraction }