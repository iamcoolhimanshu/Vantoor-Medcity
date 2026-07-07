package codewithhimanshu.communication.controller;

import codewithhimanshu.communication.entity.NotificationEntity;
import codewithhimanshu.communication.service.CommunicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin("*")
@RequiredArgsConstructor
@Tag(name = "In-App Notifications")
public class NotificationController {

    private final CommunicationService commService;

    @GetMapping("/all")
    @Operation(summary = "Get all notifications for logged-in user")
    public ResponseEntity<List<NotificationEntity>> getNotifications() {
        return ResponseEntity.ok(commService.getNotifications());
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications for logged-in user")
    public ResponseEntity<List<NotificationEntity>> getUnreadNotifications() {
        return ResponseEntity.ok(commService.getUnreadNotifications());
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark specific notification as read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        commService.markNotificationAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all unread notifications as read")
    public ResponseEntity<Void> markAllAsRead() {
        commService.markAllNotificationsAsRead();
        return ResponseEntity.ok().build();
    }
}
