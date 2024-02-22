import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import  { bundleResourceIO} from '@tensorflow/tfjs-react-native';


const App = async () => {
    const modelJSON = require('./components/model.json');
    const modelWeights = require('./components/group1-shard1of1.bin');
    const model = await tf
      .loadLayersModel(bundleResourceIO(modelJSON, modelWeights))
      .catch((e) => {
        console.log('Error', e);
      });
  
      console.log("modeelll", model)
    return model;
  };

  
  export default App;