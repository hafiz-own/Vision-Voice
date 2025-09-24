let recognition;
        let voiceEnabled = false;

        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = "en-US";

            recognition.onresult = function (event) {
                const command = event.results[0][0].transcript.toLowerCase();
                // console.log("Voice Command:", command);
                 document.getElementById("status").innerText = 'Heard: ' + command;

                if (command.includes("increase font size")) {
                    document.getElementById("increase-text").click();
                }
                else if (command.includes("decrease font size")) {
                    document.getElementById("decrease-text").click();
                }
                else if (command.includes("dark theme")) {
                    document.getElementById("dark-theme").click();
                }
                else if (command.includes("light theme")) {
                    document.getElementById("light-theme").click();
                }
                else if (command.includes("read page")) {
                    document.getElementById("read-page").click();
                }
                else if (command.includes("stop")) {
                    document.getElementById("cancel").click();
                    document.getElementById("cancel-pdf").click();
                }
                // else if (command.includes("stop")) {
                // }
                else if (command.includes("read pdf")) {
                    document.getElementById("read-pdf").click();
                }
            };

            // recognition.onerror = function (event) {
            //     console.error("Voice recognition error", event.error);
            // };
        }

        recognition.onend = function () {
            if (voiceEnabled) {
                recognition.start();
            }
        }
        // Voice toggle button
        document.getElementById("voice-toggle").addEventListener("click", () => {
            if (!voiceEnabled) {
                alert('Say Commands like Increase Font-Size, Decrease Font-Size, Light Theme, Dark Theme, Read Page, Read Pdf, Stop Speaking');
                recognition.start();
                voiceEnabled = true;
                 document.getElementById("status").innerText = "Listening...";
                document.getElementById("voice-toggle").innerText = "Disable Voice";
            } else {
                recognition.stop();
                voiceEnabled = false;
                document.getElementById("voice-toggle").innerText = "Enable Voice";
                 document.getElementById("status").innerText = "";
            }
        });
    (async function () {

      // PDF.js worker setup (must match library version)
      if (window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';
      } else {
        console.error('PDF.js library not loaded');
        announce('PDF.js library failed to load. Please refresh the page.');
      }

      // Elements
      const fileInput = document.getElementById('file');
      const preview = document.querySelector('.preview');
      const readBtn = document.getElementById('read');
      // const pauseBtn = document.getElementById('pause');
      // const resumeBtn = document.getElementById('resume');
      const stopBtn = document.getElementById('stop');
      // const statusEl = document.getElementById('status');
      // const progressEl = document.getElementById('progress');
      const live = document.getElementById('live');

      // TTS state
      const synth = window.speechSynthesis;
      let chunkQueue = [];    // array of strings (chunks)
      let chunkIndex = 0;     // current chunk index
      let isReading = false;
      let isPaused = false;
      let wasStopped = false;
      let currentUtter = null;
      let extractedText = '';

      // pdf is not loading if below function is commented
      function announce(msg) {
        if (live) {
          live.textContent = '';
          setTimeout(() => { live.textContent = msg; }, 50);
        }
        // statusEl.textContent = msg;
        console.log('[announce]', msg);
      }

      // Split text into small chunks (so pause is responsive)
      function chunkText(text, maxLen = 1000) {
        if (!text) return [];
        // split by sentences but fallback to slices if a sentence is too long
        const sentences = text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [text];
        const chunks = [];
        let buf = '';
        for (const s of sentences) {
          if ((buf + s).length <= maxLen) {
            buf += s;
          } else {
            if (buf) chunks.push(buf);
            if (s.length > maxLen) {
              for (let i = 0; i < s.length; i += maxLen) {
                chunks.push(s.slice(i, i + maxLen));
              }
              buf = '';
            } else {
              buf = s;
            }
          }
        }
        if (buf) chunks.push(buf);
        return chunks;
      }

      function updateControls() {
        readBtn.disabled = !extractedText;
        // pauseBtn.disabled = !isReading || isPaused;
        // resumeBtn.disabled = !(isReading && isPaused) && (!wasStopped && !isReading);
        stopBtn.disabled = !isReading && !wasStopped;
        // progressEl.textContent = chunkQueue.length ? `(${chunkIndex + 1}/${chunkQueue.length})` : '';
      }

      // Speak the queue starting at current chunkIndex
      function speakQueue() {
        if (!synth) { announce('Text-to-speech not supported'); return; }
        if (!chunkQueue.length || chunkIndex >= chunkQueue.length) {
          announce('Nothing to read');
          isReading = false;
          updateControls();
          return;
        }

        wasStopped = false;
        isReading = true;
        isPaused = false;
        updateControls();

        function speakCurrent() {
          // if stopped while waiting, bail
          if (wasStopped) {
            isReading = false;
            updateControls();
            announce('Stopped');
            return;
          }

          if (chunkIndex >= chunkQueue.length) {
            isReading = false;
            announce('Finished reading');
            updateControls();
            return;
          }

          const text = chunkQueue[chunkIndex];
          currentUtter = new SpeechSynthesisUtterance(text);
          currentUtter.rate = 1.0;

          currentUtter.onstart = () => {
            announce(`Reading chunk ${chunkIndex + 1} of ${chunkQueue.length}`);
            // pauseBtn.disabled = false;
            // resumeBtn.disabled = true;
            stopBtn.disabled = false;
          };

          currentUtter.onend = () => {
            // If paused (user hit Pause), don't advance; resume() will continue the same utter if paused,
            // otherwise if we finished this chunk normally we advance to next
            if (wasStopped) {
              isReading = false;
              updateControls();
              announce('Stopped');
              return;
            }
            if (isPaused || synth.paused) {
              synth.resume();
              // don't progress; when resume called, synth.resume() will continue the same utter OR resumeQueue logic will handle continuation
              return;
            }
            // advance to next chunk and speak it
            chunkIndex++;
            setTimeout(() => { speakCurrent(); }, 60);
          };

          currentUtter.onerror = (e) => {
            console.error('Speech error', e);
            announce('Speech error');
            isReading = false;
            updateControls();
          };

          synth.speak(currentUtter);
        }

        // start current utter
        speakCurrent();
      }

      // function pauseReading() {
      //   if (!synth) return;
      //   if (synth.speaking && !synth.paused) {
      //     synth.pause();
      //     isPaused = true;
      //     announce('Paused');
      //     updateControls();
      //   }
      // }

      // function resumeReading() {
      //   if (!synth) return;

      //   // If the engine is paused, resume the current utterance
      //   if (synth.paused) {
      //     synth.resume();
      //     isPaused = false;
      //     isReading = true;
      //     announce('Resumed');
      //     updateControls();
      //     return;
      //   }

      //   // If not speaking but we've been stopped previously (wasStopped true),
      //   // we resume from the current chunkIndex by restarting speakQueue
      //   if (!synth.speaking && (wasStopped || (chunkIndex < chunkQueue.length && !isReading))) {
      //     wasStopped = false;
      //     announce('Resuming from last position');
      //     speakQueue();
      //     return;
      //   }

      //   // If we've finished all chunks but have text, restart from beginning
      //   if (!synth.speaking && chunkQueue.length && chunkIndex >= chunkQueue.length) {
      //     chunkIndex = 0;
      //     speakQueue();
      //     return;
      //   }
      // }

      function stopReading() {
        if (!synth) return;
        synth.cancel(); // cancels current utterance(s)
        wasStopped = true;
        isPaused = false;
        isReading = false;
        // Keep chunkQueue and chunkIndex so Resume can continue from current chunkIndex (if desired).
        // If you prefer Stop to clear everything, uncomment:
        // chunkQueue = []; chunkIndex = 0;
        announce('Stopped');
        updateControls();
      }

      // File upload and PDF.js extraction
      fileInput.addEventListener('change', async (e) => {
        // reset
        synth && synth.cancel();
        chunkQueue = []; chunkIndex = 0; isReading = false; isPaused = false; wasStopped = false;
        extractedText = '';
        updateControls();
        announce('Loading PDF and extracting text...');

        const f = e.target.files && e.target.files[0];
        if (!f) {
          announce('No file selected');
          preview.src = '';
          return;
        }
        if (f.type !== 'application/pdf') {
          announce('Please select a PDF file');
          preview.src = '';
          return;
        }

        // preview
        preview.src = URL.createObjectURL(f);
        try {
          if (!window.pdfjsLib) {
            throw new Error('PDF.js library not available');
          }
          
          const arrayBuffer = await f.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          const maxPages = pdf.numPages;
          const pages = [];
          for (let p = 1; p <= maxPages; p += 1) {
            const page = await pdf.getPage(p);
            const content = await page.getTextContent();
            const pageText = content.items.map(i => i.str || '').join(' ');
            pages.push(pageText);
            announce(`Extracted page ${p} / ${maxPages}`);
          }
          extractedText = pages.join('\n\n').replace(/\s+/g, ' ').trim();

          if (!extractedText) {
            announce('No selectable text found (PDF may be scanned images).');
            readBtn.disabled = true;
            return;
          }

          // chunk text for responsive pause/resume
          chunkQueue = chunkText(extractedText, 1000);
          chunkIndex = 0;
          announce(`PDF ready — ${chunkQueue.length} chunk(s) prepared`);
          updateControls();
        } catch (err) {
          console.error(err);
          announce('Failed to extract PDF text (see console)');
          readBtn.disabled = true;
        }
      });

      // Wire buttons
      readBtn.addEventListener('click', () => {
        if (!chunkQueue.length) { announce('No text to read — upload a PDF'); return; }
        // If we've finished previously, start from beginning
        if (chunkIndex >= chunkQueue.length) chunkIndex = 0;
        speakQueue();
        updateControls();
      });

      // pauseBtn.addEventListener('click', pauseReading);
      // resumeBtn.addEventListener('click', resumeReading);
      stopBtn.addEventListener('click', stopReading);

      // initial UI state
      updateControls();
      announce('Ready — upload a PDF to get started (Chrome / Edge recommended)');

      //  VOICE COMMANDS
    //   const voiceBtn = document.getElementById('voice');
    //   const voiceStatus = document.getElementById('voiceStatus');


    //   let recognition;
    //   let voiceActive = false; // state

    //   if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    //     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    //     recognition = new SpeechRecognition();
    //     recognition.continuous = true;
    //     recognition.interimResults = false;
    //     recognition.lang = 'en-US';

    //     recognition.onstart = () => {
    //       voiceStatus.textContent = "🎙 Listening... Say 'read', 'pause', 'resume', 'stop'.";
    //       announce('Voice control enabled');
    //     };

    //     recognition.onresult = (event) => {


    //       const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    //       console.log("Heard:", transcript);
    //       voiceStatus.textContent = `Heard: ${transcript}`;
    //       if (transcript.includes("dark mode")) {
    //         setDarkMode(true);
    //       } else if (transcript.includes("light mode")) {
    //         setDarkMode(false);
    //       }
    //       if (transcript.includes("read")) {
    //         readBtn.click();
    //       }
    //       //  else if (transcript.includes("pause")) {
    //       //   pauseBtn.click();
    //       // } else if (transcript.includes("resume")) {
    //       //   resumeBtn.click();
    //       // }
    //        else if (transcript.includes("stop")) {
    //         stopBtn.click();
    //       } else {
    //         announce("Command not recognized");
    //       }
    //     };

    //     recognition.onerror = (event) => {
    //       console.error("Speech recognition error", event.error);
    //       voiceStatus.textContent = `Error: ${event.error}`;
    //     };

    //     recognition.onend = () => {
    //       if (voiceActive) {
    //         recognition.start(); // keep listening until disabled
    //       }
    //     };

    //   } else {
    //     voiceBtn.disabled = true;
    //     voiceStatus.textContent = "Voice commands not supported in this browser.";
    //     announce("Voice commands not supported");
    //   }


    // // THEME TOGGLE
    //   const themeBtn = document.getElementById('themeToggle');
    //   let isDark = false;


    //   themeBtn.addEventListener('click', () => setDarkMode(!isDark));
       
      document.querySelector('#read-pdf').addEventListener('click',()=>{
         readBtn.click();
      })
      document.querySelector('#cancel-pdf').addEventListener('click',()=>{
        stopBtn.click();
      })

    })();
     const right =  document.querySelector('.right-section1')
        document.querySelector(".header-btn").addEventListener('click',()=>{
            
           right.classList.toggle('right-toogle');
        })
        let currentFontSize = 16; 

        // Increase text size
        document.getElementById("increase-text").addEventListener("click", () => {
            currentFontSize += 2;
            document.body.style.fontSize = currentFontSize + "px";
        });

        // Decrease text size
        document.getElementById("decrease-text").addEventListener("click", () => {
            if (currentFontSize > 10) {
                currentFontSize -= 2;
                document.body.style.fontSize = currentFontSize + "px";
            }
        });

        // Dark theme toggle
        document.getElementById("dark-theme").addEventListener("click", () => {
            document.body.classList.add("dark-mode");
              document.querySelector('.right-section1').classList.add('dark1');
              document.querySelectorAll('.rightSectionBtn').forEach(btn=>{
               btn.classList.add('dark2')
              });
               document.querySelectorAll('.list').forEach(btn => {
                btn.classList.add('dark2');
            })
             document.querySelectorAll('.nav-icon').forEach(icon =>{
                icon.classList.add('dark3')
            })
              document.querySelector('.navigation').classList.add('dark2');
              document.querySelector('.footer').classList.add('dark2');
             document.querySelector('.preview').classList.add('dark1');
            document.querySelector('.header-top').classList.add('dark1');
            document.querySelector('.status1').classList.add('dark1'); 
        });

    //  light:
    document.querySelector('#light-theme').addEventListener('click',()=>{
      document.body.classList.remove("dark-mode");
              document.querySelector('.right-section1').classList.remove('dark1');
              document.querySelectorAll('.rightSectionBtn').forEach(btn=>{
               btn.classList.remove('dark2')
              });
              document.querySelectorAll('.list').forEach(btn => {
                btn.classList.remove('dark2');
            })
             document.querySelectorAll('.nav-icon').forEach(icon =>{
                icon.classList.remove('dark3')
            })
              document.querySelector('.navigation').classList.remove('dark2');
              document.querySelector('.footer').classList.remove('dark2');
             document.querySelector('.preview').classList.remove('dark1');
            document.querySelector('.header-top').classList.remove('dark1');
            document.querySelector('.status1').classList.remove('dark1');
    })

        // Read Page (Text-to-Speech)
        const synth = window.speechSynthesis;

        document.getElementById("read-page").addEventListener("click", () => {
            const text = document.body.innerText;
            const utterance = new SpeechSynthesisUtterance(text);
            synth.cancel(); // stop previous
            synth.speak(utterance);
        });
         document.getElementById("cancel").addEventListener("click", () => {
            synth.cancel(); // stop previous
            // synth.speak(utterance);
        });

        // // Read Welcome button
        // document.getElementById("read-welcome").addEventListener("click", () => {
        //     const text = document.getElementById("welcome-text").innerText;
        //     const utterance = new SpeechSynthesisUtterance(text);
        //     synth.cancel();
        //     synth.speak(utterance);
        // });
    //  document.querySelector('#read-para').addEventListener('click',()=>{
    //   readBtn.click();
    //  })