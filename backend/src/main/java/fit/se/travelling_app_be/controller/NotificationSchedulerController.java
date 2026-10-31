package fit.se.travelling_app_be.controller;

import fit.se.travelling_app_be.service.NotificationSchedulerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications/scheduler")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationSchedulerController {
    
    private final NotificationSchedulerService schedulerService;
    
    @PostMapping("/check-upcoming")
    public ResponseEntity<String> checkUpcomingTours() {
        schedulerService.checkUpcomingToursManually();
        return ResponseEntity.ok("Checked upcoming tours and sent notifications");
    }
}

