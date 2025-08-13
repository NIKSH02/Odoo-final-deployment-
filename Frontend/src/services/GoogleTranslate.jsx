import { useEffect } from "react";

const GoogleTranslate = () => {
    useEffect(() => {
        // This check ensures the script only loads once and re-initializes if needed.
        if (!window.googleTranslateInit) {
            window.googleTranslateInit = () => {
                // Wait for google.translate.TranslateElement to be available
                if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) {
                    setTimeout(window.googleTranslateInit, 100); // Retry after 100ms
                } else {
                    new window.google.translate.TranslateElement({
                        pageLanguage: 'en',
                        includedLanguages: 'en,hi,pa,sa,mr,ur,bn,ta,te,kn,ml,gu,or,as,ne,si,ks,ma,sd,bo',
                        layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
                        defaultLanguage: 'en',
                        // You can try adjusting autoDisplay and autoDetect for subtle changes,
                        // but they mostly affect initial behavior, not the banner.
                        // autoDisplay: false, // Prevents automatic display of the widget if you want to trigger it manually
                        // autoDetect: false, // Prevents automatic language detection
                    }, 'google_element');
                }
            };

            const loadGoogleTranslateScript = () => {
                if (!document.getElementById("google_translate_script")) {
                    const script = document.createElement("script");
                    script.type = "text/javascript";
                    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateInit";
                    script.id = "google_translate_script";
                    script.onerror = () => console.error('Error loading Google Translate script');
                    document.body.appendChild(script);
                } else {
                    // If script already exists, just re-initialize the widget
                    window.googleTranslateInit();
                }
            };

            loadGoogleTranslateScript();
        } else {
            // If the script and init function are already loaded (e.g., component remounts),
            // just call the init function to ensure the widget is rendered.
            window.googleTranslateInit();
        }

        // Cleanup function for React to prevent re-initialization on unmount/remount
        // (though Google Translate's global nature makes this less critical for this specific case)
        return () => {
            // You might want to clean up if the component is unmounted,
            // but for Google Translate, it often remains initialized globally.
            // Be cautious with destructive cleanups as they might affect other parts of your app.
        };

    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <div id="google_element" className="google-translate-container"></div>
    );
};

export default GoogleTranslate;