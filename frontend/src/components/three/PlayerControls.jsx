import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function PlayerControls({ colliders, onPointerLockChange }) {
  const { camera, gl } = useThree()
  const keys   = useRef({})
  const yaw    = useRef(0)
  const pitch  = useRef(0)
  const locked = useRef(false)
  const playerSize = new THREE.Vector3(0.6, 1.6, 0.6)

  useEffect(() => {
    const canvas = gl.domElement

    const onKey = (e, val) => { keys.current[e.code] = val }
    const onDown = (e) => { keys.current[e.code] = true }
    const onUp   = (e) => { keys.current[e.code] = false }

    const onMouseMove = (e) => {
      if (!locked.current) return
      yaw.current   -= e.movementX * 0.002
      pitch.current -= e.movementY * 0.002
      pitch.current  = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch.current))
    }

    const onLockChange = () => {
      const isLocked = document.pointerLockElement === canvas
      locked.current = isLocked
      onPointerLockChange?.(isLocked)
    }

    const onClick = () => {
      // Only lock pointer if user clicks but not on an artwork (handled by canvas click)
      canvas.requestPointerLock()
    }

    canvas.addEventListener('click', onClick)
    document.addEventListener('keydown', onDown)
    document.addEventListener('keyup',   onUp)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onLockChange)

    return () => {
      canvas.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onDown)
      document.removeEventListener('keyup',   onUp)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onLockChange)
    }
  }, [gl, onPointerLockChange])

  useFrame((_, delta) => {
    const speed = keys.current['ShiftLeft'] ? 8 : 4
    const dir   = new THREE.Vector3()

    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ')
    camera.quaternion.setFromEuler(euler)

    const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, yaw.current, 0))
    const right   = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, yaw.current, 0))

    if (keys.current['KeyW'] || keys.current['ArrowUp'])    dir.add(forward)
    if (keys.current['KeyS'] || keys.current['ArrowDown'])  dir.sub(forward)
    if (keys.current['KeyA'] || keys.current['ArrowLeft'])  dir.sub(right)
    if (keys.current['KeyD'] || keys.current['ArrowRight']) dir.add(right)

   if (dir.lengthSq() > 0) {

  dir.normalize()

  const nextPos = camera.position.clone()
  nextPos.addScaledVector(dir, speed * delta)

  const playerBox = new THREE.Box3().setFromCenterAndSize(
    nextPos,
    playerSize
  )

  let blocked = false

  for (const collider of colliders) {

    const colliderBox = new THREE.Box3().setFromObject(collider)

    if (playerBox.intersectsBox(colliderBox)) {
      blocked = true
      break
    }
  }

  if (!blocked) {
    camera.position.copy(nextPos)
  }

}

    // Clamp to room bounds
    camera.position.y = 1.6 // Fixed eye height
  })

  return null
}
