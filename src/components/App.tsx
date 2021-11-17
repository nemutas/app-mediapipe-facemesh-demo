import { button, useControls } from 'leva';
import React, { FC, useCallback, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { css } from '@emotion/css';
import { Camera } from '@mediapipe/camera_utils';
import {
	FaceMesh, FACEMESH_LEFT_EYE, FACEMESH_LIPS, FACEMESH_RIGHT_EYE, Results
} from '@mediapipe/face_mesh';
import { draw } from '../utils/drawCanvas';

export const App: FC = () => {
	const webcamRef = useRef<Webcam>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const resultsRef = useRef<Results>()

	// コントローラーの追加
	const datas = useControls({
		bgImage: false,
		landmark: {
			min: 0,
			max: 477,
			step: 1,
			value: 0
		},
		result: button(() => {
			OutputData()
		})
	})

	/** 検出結果をconsoleに出力する */
	const OutputData = () => {
		const results = resultsRef.current!
		console.log(results.multiFaceLandmarks[0])
		console.log('FACEMESH_LEFT_EYE', FACEMESH_LEFT_EYE)
		console.log('FACEMESH_RIGHT_EYE', FACEMESH_RIGHT_EYE)
		console.log('FACEMESH_LIPS', FACEMESH_LIPS)
	}

	/** 検出結果（フレーム毎に呼び出される） */
	const onResults = useCallback(
		(results: Results) => {
			// 検出結果の格納
			resultsRef.current = results
			// 描画処理
			const ctx = canvasRef.current!.getContext('2d')!
			draw(ctx, results, datas.bgImage, datas.landmark)
		},
		[datas]
	)

	useEffect(() => {
		const faceMesh = new FaceMesh({
			locateFile: file => {
				return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
			}
		})

		faceMesh.setOptions({
			maxNumFaces: 1,
			refineLandmarks: true, // landmarks 468 -> 478
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5
		})

		faceMesh.onResults(onResults)

		if (webcamRef.current) {
			const camera = new Camera(webcamRef.current.video!, {
				onFrame: async () => {
					await faceMesh.send({ image: webcamRef.current!.video! })
				},
				width: 1280,
				height: 720
			})
			camera.start()
		}

		return () => {
			faceMesh.close()
		}
	}, [onResults])

	return (
		<div className={styles.container}>
			{/* capture */}
			<Webcam
				ref={webcamRef}
				style={{ visibility: 'hidden' }}
				audio={false}
				width={1280}
				height={720}
				mirrored
				screenshotFormat="image/jpeg"
				videoConstraints={{ width: 1280, height: 720, facingMode: 'user' }}
			/>
			{/* draw */}
			<canvas ref={canvasRef} className={styles.canvas} width={1280} height={720} />
		</div>
	)
}

// ==============================================
// styles

const styles = {
	container: css`
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
	`,
	canvas: css`
		position: absolute;
		width: 1280px;
		height: 720px;
		background-color: #1e1e1e;
		border: 1px solid #fff;
	`
}
