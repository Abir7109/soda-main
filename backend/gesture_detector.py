import struct
import time
import math
import os
from logger import log


class GestureDetector:
    def __init__(
        self,
        spike_ratio=None,
        cooldown_s=None,
        min_double_gap=None,
        max_double_gap=None,
        noise_floor_alpha=None,
        min_rms=None,
    ):
        self.spike_ratio = spike_ratio if spike_ratio is not None else float(os.getenv("GESTURE_SPIKE_RATIO", "2.5"))
        self.cooldown_s = cooldown_s if cooldown_s is not None else 0.45
        self.min_double_gap = min_double_gap if min_double_gap is not None else 0.05
        self.max_double_gap = max_double_gap if max_double_gap is not None else 1.0
        self.noise_floor_alpha = noise_floor_alpha if noise_floor_alpha is not None else 0.95
        self.min_rms = min_rms if min_rms is not None else 0.008

        self.noise_floor = 0.005
        self.last_logged_double = 0.0
        self.first_clap_time = None
        self.last_spike_time = 0.0

    def feed(self, pcm_bytes, sample_rate):
        count = len(pcm_bytes) // 2
        if count == 0:
            return None
        shorts = struct.unpack(f"<{count}h", pcm_bytes)
        squares = 0
        for s in shorts:
            squares += s * s
        rms_float = math.sqrt(squares / count) / 32768.0

        # Running average noise floor — adapts to ambient level
        self.noise_floor = self.noise_floor_alpha * self.noise_floor + (
            1.0 - self.noise_floor_alpha
        ) * rms_float
        self.noise_floor = max(self.noise_floor, 1e-7)

        threshold = max(self.noise_floor * self.spike_ratio, self.min_rms)
        now = time.monotonic()

        if (
            rms_float >= threshold
            and (now - self.last_spike_time) >= 0.05  # min gap between spikes
        ):
            self.last_spike_time = now
            if self.first_clap_time is None:
                self.first_clap_time = now
                log.info(
                    f"GestureDetector: first clap (rms={rms_float:.5f}, "
                    f"noise_floor={self.noise_floor:.5f}, ratio={rms_float/max(self.noise_floor,1e-10):.1f}x)"
                )
            else:
                gap = now - self.first_clap_time
                if gap < self.min_double_gap:
                    pass
                elif gap <= self.max_double_gap:
                    self.first_clap_time = None
                    log.info(
                        f"GestureDetector: double clap (gap={gap:.3f}s, "
                        f"rms={rms_float:.5f}, noise_floor={self.noise_floor:.5f})"
                    )
                    return "double_clap"
                else:
                    self.first_clap_time = now

        return None
