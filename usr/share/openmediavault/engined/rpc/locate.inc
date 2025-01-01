<?php
/*
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @author    OpenMediaVault Plugin Developers <plugins@omv-extras.org>
 * @copyright Copyright (c) 2009-2013 Volker Theile
 * @copyright Copyright (c) 2015-2025 openmediavault plugin developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

class OMVRpcServiceLocate extends \OMV\Rpc\ServiceAbstract
{
    public function getName()
    {
        return 'Locate';
    }

    public function initialize()
    {
        $this->registerMethod('executeSearch');
        $this->registerMethod('executeUpdate');
    }

    public function executeSearch($params, $context)
    {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, ["role" => OMV_ROLE_ADMINISTRATOR]);

        $results = [];

        if (strlen($params['search']) > 2) {
            $cmdArgs = [];
            $cmdArgs[] = "--ignore-case";
            $cmdArgs[] = "--limit=500";
            $cmdArgs[] = escapeshellarg($params['search']);
            $cmd = new \OMV\System\Process("locate", $cmdArgs);
            $cmd->setQuiet(true);
            $cmd->execute($output);

            if (!empty($output)) {
                foreach ($output as $line) {
                    if (empty($line))
                        continue;

                    // Prepare configuration data.
                    $results[] = [
                        "file" => trim($line)
                    ];
                }
            }
        } else {
            $results[] = [
                "file" => gettext("Search must use at least three characters.")
            ];
        }

        // Filter the result.
        return $this->applyFilter($results, $params['start'], $params['limit'],
            $params['sortfield'], $params['sortdir'], $params['search']);
    }

    public function executeUpdate($params, $context)
    {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, ["role" => OMV_ROLE_ADMINISTRATOR]);

        $cmd = new \OMV\System\Process("updatedb");
        $cmd->execute($output);

    }
}
