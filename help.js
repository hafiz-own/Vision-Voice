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
                alert('Say Commands like Increase Font-Size, Decrease Font-Size, Light Theme, Dark Theme, Read Page, Read Pdf, Stop');
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
        const right = document.querySelector('.right-section1')
        document.querySelector(".header-btn").addEventListener('click', () => {

            right.classList.toggle('right-toogle');
        })
        let currentFontSize = 16; // base font size

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
            document.querySelector('.right-section1').classList.add('dark1');
            document.querySelector('.header-top').classList.add('dark1');
            // document.querySelector('.navigation').classList.add('dark2');
            document.querySelectorAll('.rightSectionBtn').forEach(btn => {
                btn.classList.add('dark2')
            });
            document.querySelectorAll('.list').forEach(btn => {
                btn.classList.add('dark2');
            })
             document.querySelector('.navigation').classList.add('dark2');
              document.querySelector('.theme').classList.add('dark2');
              document.querySelector('.notes').classList.add('dark2');
              document.querySelector('.aloud').classList.add('dark2');
              document.querySelector('.commands').classList.add('dark2');
            document.querySelector('.footer').classList.add('dark1');
             document.querySelectorAll('.nav-icon').forEach(icon =>{
                icon.classList.add('dark3')
            })
            // document.querySelector('.left-section1').classList.add('dark2');
            document.body.classList.add("dark");
            // document.body.classList.remove("");

        });
        //  Light theme:
        document.querySelector('#light-theme').addEventListener('click',()=>{
            // alert('hy');
            document.querySelector('.right-section1').classList.remove('dark1');
            document.querySelector('.header-top').classList.remove('dark1');
            // document.querySelector('.navigation').classList.remove('dark2');
            document.querySelectorAll('.rightSectionBtn').forEach(btn => {
                btn.classList.remove('dark2')
            });
             document.querySelectorAll('.nav-icon').forEach(icon =>{
                icon.classList.remove('dark3')
            })
            document.querySelectorAll('.list').forEach(btn => {
                btn.classList.remove('dark2');
            })
             document.querySelector('.navigation').classList.remove('dark2');

            // document.querySelectorAll('.list').forEach(btn => {
            //     btn.classList.remove('dark2');
            // })
            document.querySelector('.theme').classList.remove('dark2');
              document.querySelector('.notes').classList.remove('dark2');
              document.querySelector('.aloud').classList.remove('dark2');
              document.querySelector('.commands').classList.remove('dark2');
            document.querySelector('.footer').classList.remove('dark1');
            // document.querySelector('.left-section1').classList.remove('dark2');
            document.body.classList.remove("dark");
            // document.body.classList.remove("high-contrast");
        });
        

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