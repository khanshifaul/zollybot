// Metro resolves a bundled TensorFlow Lite model to an asset id.
declare module "*.tflite" {
  const asset: number;
  export default asset;
}
