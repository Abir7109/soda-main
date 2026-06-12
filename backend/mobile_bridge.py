import base64
import asyncio
import struct


def _pcm_to_wav(pcm_bytes, sample_rate=24000):
    num_channels = 1
    bits_per_sample = 16
    byte_rate = sample_rate * num_channels * bits_per_sample // 8
    block_align = num_channels * bits_per_sample // 8
    data_size = len(pcm_bytes)
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF", 36 + data_size, b"WAVE",
        b"fmt ", 16, 1, num_channels,
        sample_rate, byte_rate, block_align, bits_per_sample,
        b"data", data_size,
    )
    return header + pcm_bytes


class MobileBridge:

    def __init__(self, sio, mobile_sessions):
        self.sio = sio
        self.mobile_sessions = mobile_sessions

    async def _emit_all(self, event, data):
        sessions = list(self.mobile_sessions)
        if not sessions:
            return
        for sid in sessions:
            try:
                await self.sio.emit(event, data, room=sid)
            except Exception:
                pass

    async def forward_status(self, msg):
        await self._emit_all("soda_status", {"msg": msg})

    async def forward_transcription(self, text, is_user=True):
        await self._emit_all("soda_transcription", {
            "sender": "User" if is_user else "SODA",
            "text": text,
        })

    async def forward_audio(self, pcm_bytes):
        wav_bytes = _pcm_to_wav(pcm_bytes)
        b64 = base64.b64encode(wav_bytes).decode("ascii")
        await self._emit_all("soda_audio", {"data": b64})

    async def forward_mic_level(self, level):
        await self._emit_all("mic_level", {"level": level})

    async def forward_tool_result(self, tool_name, result_data):
        await self._emit_all("soda_tool_result", {
            "tool": tool_name,
            "result": result_data,
        })

    async def forward_error(self, msg):
        await self._emit_all("soda_error", {"msg": msg})

    async def forward_connection_count(self, count):
        await self._emit_all("soda_remote_count", {"count": count})
