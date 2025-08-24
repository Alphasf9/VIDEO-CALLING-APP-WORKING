class PeerService {
    constructor() {
        // Each instance gets its own RTCPeerConnection
        this.peer = new RTCPeerConnection({
            iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
        });
    }

    addLocalStream(stream) {
        stream.getTracks().forEach((track) => this.peer.addTrack(track, stream));
    }

    async getOffer() {
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(offer);
        return offer;
    }

    async getAnswer(offer) {
        await this.peer.setRemoteDescription(offer);
        const answer = await this.peer.createAnswer();
        await this.peer.setLocalDescription(answer);
        return answer;
    }

    async setRemoteDescription(answer) {
        await this.peer.setRemoteDescription(answer);
    }

    onTrack(callback) {
        this.peer.ontrack = (event) => {
            const [stream] = event.streams;
            callback(stream);
        };
    }

    onIceCandidate(callback) {
        this.peer.onicecandidate = (event) => {
            if (event.candidate) callback(event.candidate);
        };
    }

    addIceCandidate(candidate) {
        return this.peer.addIceCandidate(candidate);
    }
}

export default PeerService;
