# Easy Access - Inclusive Website
Voice Vision is a web application designed to make reading more accessible, especially for visually impaired persons.
The project integrates speech recognition and text-to-speech functionality, along with customizable themes (dark mode) to improve usability and accessibility.

It’s simple, lightweight, and aims to provide a more inclusive Human-Computer Interaction (HCI) experience.

## Run
Open `index.html` in any modern browser. No build step required.

## Features
- Voice Input (Speech-to-Text):
    Uses webkitSpeechRecognition API (works best on Chrome desktop).

- Text-to-Speech (Read Aloud):
    Converts PDF into speech for easy listening.

- Uploading & Reading PDF

- Accessibility Modes:
    Dark Mode for low-light conditions.

- Dynamic UI Enhancements:
    Rotating header text animation (Welcome to AudioNotes | Doc2Speech | EchoRead).
    Background image slideshow with smooth transitions.

## Technologies Used

Frontend: HTML5, CSS3, JavaScript (Vanilla JS)

Speech Recognition API: webkitSpeechRecognition

Text-to-Speech API: speechSynthesis (Web Speech API)

## Voice Commands (examples)

- "Increase Font-Size", "Decrease Font-Size"

- "Dark Theme", "Light Theme"

- "Read Page", "Read PDF", "Stop"

## Future Improvements

- Add support for multiple languages in speech recognition.

- Store preferences in local storage or connect with a database.

- Mobile-optimized UI for better accessibility.
