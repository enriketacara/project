<?php

namespace App\Domain\Inspection\Support;

use App\Domain\Inspection\Enums\Location;

final class TimezoneResolver
{
    public static function fromLocation(string $location): string
    {
        return Location::from($location)->timezone();
    }
}
