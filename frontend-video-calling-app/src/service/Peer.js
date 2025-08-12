class PeerService {
    constructor() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [{
                    urls: [
                        'stun:stun.l.google.com:19302',
                        'stun:stun.l.google.com:5349'
                    ]
                }]
            })
        }
    };

    async getOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(offer);
            return offer;
        }
    };

    async getAnswer(offer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(offer);
            const answer = await this.peer.createAnswer();
            await this.peer.setLocalDescription(answer);
            return answer;
        }
    };


    async setLocalDescription(answer) {
        await this.peer.setRemoteDescription(answer);
    }

    onTrack(callback) {
        this.peer.ontrack = (event) => {
            const [stream] = event.streams;
            callback(stream);
        };
    }

}


export default new PeerService();
