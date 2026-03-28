package ai.runanywhere.starter

import android.media.MediaPlayer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import com.facebook.react.bridge.*
import java.io.File
import java.util.*
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class LocalTTSModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), TextToSpeech.OnInitListener {

    private val executorService: ExecutorService = Executors.newSingleThreadExecutor()
    private var systemTTS: TextToSpeech? = null
    private var isSystemTTSReady = false
    private var pendingPromise: Promise? = null
    private var mediaPlayer: MediaPlayer? = null

    init {
        systemTTS = TextToSpeech(reactContext, this)
        systemTTS?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {}
            override fun onDone(utteranceId: String?) {
                pendingPromise?.resolve("finished")
                pendingPromise = null
            }
            override fun onError(utteranceId: String?) {
                pendingPromise?.reject("TTS_ERROR", "Speech failed")
                pendingPromise = null
            }
        })
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val locale = Locale("hi", "IN")
            systemTTS?.language = locale
            
            try {
                val voices = systemTTS?.voices
                val maleVoice = voices?.find { 
                    it.locale == locale && it.name.lowercase().contains("male") 
                }
                if (maleVoice != null) {
                    systemTTS?.voice = maleVoice
                }
            } catch (e: Exception) {}

            systemTTS?.setPitch(0.8f)      
            systemTTS?.setSpeechRate(0.85f) 
            isSystemTTSReady = true
        }
    }

    override fun getName() = "LocalTTS"

    @ReactMethod
    fun speak(text: String, promise: Promise) {
        stop(null) // Cancel previous
        pendingPromise = promise

        executorService.execute {
            try {
                val audioPath = getOrGenerateAudio(text)
                val audioFile = File(audioPath)

                if (!audioFile.exists()) {
                    if (isSystemTTSReady) {
                        systemTTS?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "local_tts_id")
                        // Promise will be resolved by UtteranceProgressListener.onDone
                    } else {
                        promise.reject("TTS_ERROR", "System TTS not ready")
                        pendingPromise = null
                    }
                    return@execute
                }

                mediaPlayer = MediaPlayer().apply {
                    setDataSource(audioPath)
                    prepare()
                    setOnCompletionListener {
                        it.release()
                        mediaPlayer = null
                        promise.resolve("played")
                        pendingPromise = null
                    }
                    start()
                }
            } catch (e: Exception) {
                promise.reject("TTS_ERROR", e.localizedMessage)
                pendingPromise = null
            }
        }
    }

    @ReactMethod
    fun stop(promise: Promise?) {
        try {
            systemTTS?.stop()
            mediaPlayer?.let {
                if (it.isPlaying) it.stop()
                it.release()
            }
            mediaPlayer = null
            pendingPromise?.resolve("stopped")
            pendingPromise = null
            promise?.resolve(true)
        } catch (e: Exception) {
            promise?.reject("STOP_ERROR", e.localizedMessage)
        }
    }

    private fun getOrGenerateAudio(text: String): String {
        val fileName = "${text.hashCode()}.wav"
        return File(reactApplicationContext.cacheDir, fileName).absolutePath
    }
}
