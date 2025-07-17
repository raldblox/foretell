import { FilesetResolver, TextClassifier } from "@mediapipe/tasks-text";

let textClassifier: TextClassifier | null = null;

export async function loadTextClassifier() {
  if (!textClassifier) {
    const fileset = await FilesetResolver.forTextTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-text@latest/wasm",
    );

    textClassifier = await TextClassifier.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/text_classifier/bert_classifier/float32/1/bert_classifier.tflite",
      },
      maxResults: 1,
    });
  }

  return textClassifier;
}
