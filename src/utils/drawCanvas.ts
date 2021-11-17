import { drawConnectors } from '@mediapipe/drawing_utils';
import {
	FACEMESH_FACE_OVAL, FACEMESH_LEFT_EYE, FACEMESH_LEFT_EYEBROW, FACEMESH_LEFT_IRIS, FACEMESH_LIPS,
	FACEMESH_RIGHT_EYE, FACEMESH_RIGHT_EYEBROW, FACEMESH_RIGHT_IRIS, FACEMESH_TESSELATION,
	NormalizedLandmark, Results
} from '@mediapipe/face_mesh';

/**
 * canvasに描画する
 * @param ctx コンテキスト
 * @param results 検出結果
 * @param bgImage capture imageを描画するか
 * @param emphasis 強調するlandmarkのindex
 */
export const draw = (
	ctx: CanvasRenderingContext2D,
	results: Results,
	bgImage: boolean,
	emphasis: number
) => {
	const width = ctx.canvas.width
	const height = ctx.canvas.height

	ctx.save()
	ctx.clearRect(0, 0, width, height)

	if (bgImage) ctx.drawImage(results.image, 0, 0, width, height)

	if (results.multiFaceLandmarks) {
		const lineWidth = 1
		const tesselation = { color: '#C0C0C070', lineWidth }
		const right_eye = { color: '#FF3030', lineWidth }
		const left_eye = { color: '#30FF30', lineWidth }
		const face_oval = { color: '#E0E0E0', lineWidth }

		for (const landmarks of results.multiFaceLandmarks) {
			// 顔の表面（埋め尽くし）
			drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, tesselation)
			// 右の目・眉・瞳
			drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, right_eye)
			drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYEBROW, right_eye)
			drawConnectors(ctx, landmarks, FACEMESH_RIGHT_IRIS, right_eye)
			// 左の目・眉・瞳
			drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, left_eye)
			drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYEBROW, left_eye)
			drawConnectors(ctx, landmarks, FACEMESH_LEFT_IRIS, left_eye)
			// 顔の輪郭
			drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, face_oval)
			// 唇
			drawConnectors(ctx, landmarks, FACEMESH_LIPS, face_oval)

			// landmarkの強調描画
			drawPoint(ctx, landmarks[emphasis])
		}
	}
	ctx.restore()
}

/**
 * 特定のlandmarkを強調する
 * @param ctx
 * @param point
 */
const drawPoint = (ctx: CanvasRenderingContext2D, point: NormalizedLandmark) => {
	const x = ctx.canvas.width * point.x
	const y = ctx.canvas.height * point.y
	const r = 5

	ctx.fillStyle = '#22a7f2'
	ctx.beginPath()
	ctx.arc(x, y, r, 0, Math.PI * 2, true)
	ctx.fill()
}
