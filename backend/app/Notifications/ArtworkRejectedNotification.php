<?php

namespace App\Notifications;

use App\Models\Artwork;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ArtworkRejectedNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected Artwork $artwork,
        protected string $reason
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        $artworkUrl = $frontendUrl . '/artworks/' . $this->artwork->id;

        return (new MailMessage)
            ->from(config('mail.from.address'), config('mail.from.name'))
            ->subject('❌ Karya Ditolak — Virtual Exhibition')
            ->view('emails.artwork-rejected', [
                'user' => $notifiable,
                'artwork' => $this->artwork,
                'reason' => $this->reason,
                'artworkUrl' => $artworkUrl,
            ]);
    }
}
