export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export function isStrongShake(data: Vector3D, threshold = 2.2): boolean {
  const magnitude = Math.sqrt(
    data.x * data.x + data.y * data.y + data.z * data.z
  );
  return magnitude >= threshold;
}

export function isPrivacyTilt(
  rotation: { gamma: number },
  thresholdRad = 0.65
): boolean {
  return Math.abs(rotation.gamma) >= thresholdRad;
}
