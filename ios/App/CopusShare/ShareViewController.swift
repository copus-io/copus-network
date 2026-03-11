import UIKit
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        handleSharedContent()
    }

    private func handleSharedContent() {
        guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            completeRequest()
            return
        }

        for item in extensionItems {
            guard let attachments = item.attachments else { continue }

            for attachment in attachments {
                if attachment.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    attachment.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { [weak self] data, error in
                        guard let url = data as? URL else {
                            self?.completeRequest()
                            return
                        }
                        let title = item.attributedContentText?.string ?? ""
                        self?.openMainApp(url: url.absoluteString, title: title)
                    }
                    return
                } else if attachment.hasItemConformingToTypeIdentifier(UTType.plainText.identifier) {
                    attachment.loadItem(forTypeIdentifier: UTType.plainText.identifier, options: nil) { [weak self] data, error in
                        guard let text = data as? String else {
                            self?.completeRequest()
                            return
                        }
                        // Check if the text looks like a URL
                        if text.hasPrefix("http://") || text.hasPrefix("https://") {
                            self?.openMainApp(url: text, title: "")
                        } else {
                            self?.completeRequest()
                        }
                    }
                    return
                }
            }
        }

        completeRequest()
    }

    private func openMainApp(url: String, title: String) {
        var components = URLComponents()
        components.scheme = "copus"
        components.host = "curate"
        components.queryItems = [
            URLQueryItem(name: "url", value: url),
            URLQueryItem(name: "title", value: title),
        ]

        guard let deepLink = components.url else {
            completeRequest()
            return
        }

        // Use the responder chain to open the URL
        var responder: UIResponder? = self
        while let nextResponder = responder?.next {
            if let application = nextResponder as? UIApplication {
                application.open(deepLink, options: [:], completionHandler: nil)
                break
            }
            responder = nextResponder
        }

        // Small delay to ensure the URL is opened before dismissing
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
            self?.completeRequest()
        }
    }

    private func completeRequest() {
        extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
    }
}
