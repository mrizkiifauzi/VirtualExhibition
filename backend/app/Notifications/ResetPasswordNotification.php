<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected string $token
    ) {}

    /**
     * Kirim notifikasi via email
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        $resetUrl = $frontendUrl
            . '/reset-password'
            . '?token=' . urlencode($this->token)
            . '&email=' . urlencode($notifiable->email);

        // Gunakan custom Blade template (resources/views/emails/reset-password.blade.php)
        return (new MailMessage)
            ->subject('🔐 Reset Password — Virtual Exhibition')
            ->view('emails.reset-password', [
                'user'     => $notifiable,
                'resetUrl' => $resetUrl,
            ]);
    }
}
