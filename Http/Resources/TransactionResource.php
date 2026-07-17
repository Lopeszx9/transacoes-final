<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'value' => (float) $this->value,
            'cpf' => $this->cpf,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'document_url' => $this->document_path
                ? Storage::disk('public')->url($this->document_path)
                : null,
            'document_original_name' => $this->document_original_name,
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at?->format('d/m/Y H:i:s'),
            'updated_at' => $this->updated_at?->format('d/m/Y H:i:s'),
            'deleted_at' => $this->deleted_at?->format('d/m/Y H:i:s'),
        ];
    }
}
